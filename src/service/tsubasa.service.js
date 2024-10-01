const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const botModel = require('../models/bot.model');
const userModel = require('../models/user.model');
const { apiResponse } = require('../utils/response');
const { BadRequestError, NotFoundError } = require('../core/error.response');


class TsubasaService {
  static headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "pragma": "no-cache",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Microsoft Edge\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\", \"Microsoft Edge WebView2\";v=\"129\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-masterhash": "",
    "Referer": "https://app.ton.tsubasa-rivals.com/",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0"
  };
  static daily_combo = [];
  static thread = {
    // user1: {
    // bot1:{
    // data:{}
    // lastUpgrade: 0,
    // lastClaim: 0,
    // status: 0,// 0: upgrade, 1: idle , 2 :stop
    // "x-masterhash": "",}
    // }
  }
  static parseUser(data) {
    const params = new URLSearchParams(data);
    const userString = params.get('user');
    const userObject = JSON.parse(userString);
    return userObject
  }
  static async claimDaily({ userId, playerId, botId, bot_init_data, axiosInstance }) {
    if (!userId || !axiosInstance) {
      throw new BadRequestError("Missing userId or axiosInstance");
    }
    const response = await axiosInstance.post('https://app.ton.tsubasa-rivals.com/api/card/claim', {
      initData: bot_init_data,
    }, {
      headers: {
        "x-masterhash": TsubasaService.thread[userId][botId]["x-masterhash"],
        "x-player-id": playerId,
      }
    })
    response.status === 200 && console.log("Claim daily", TsubasaService.thread[userId][botId].name);
    return response.status === 200 ? true : false
  }
  static async upgradeCard({ userId, playerId, botId, bot_init_data, axiosInstance }) {
    if (!userId || !axiosInstance) {
      throw new BadRequestError("Missing userId or axiosInstance");
    }
    const cardCanUpgrade = TsubasaService.thread[userId][botId].cardAvailable.shift();
    if (Date.now() < cardCanUpgrade.level_up_available_date * 1000 + 360000) {
      console.log("Card can't upgrade because it in lock time", cardCanUpgrade.id);
      return {
        success: false,
        message: "Card is in lock time"
      }
    }
    if (TsubasaService.thread[userId][botId].total_coins < cardCanUpgrade.cost) {
      TsubasaService.thread[userId][botId].status = 1;
      // switch bot from upgrade into idle
      return {
        success: false,
        message: "Not enough coin"
      }
    } else {
      TsubasaService.thread[userId][botId].status = 0;
      // switch bot form idle to upgrade
    }
    try {

      const response = await axiosInstance.post('https://app.ton.tsubasa-rivals.com/api/card/levelup', {
        card_id: cardCanUpgrade.id,
        category_id: cardCanUpgrade.category,
        initData: bot_init_data,
      }, {
        headers: {
          "x-masterhash": TsubasaService.thread[userId][botId]["x-masterhash"],
          "x-player-id": playerId,
        }
      })

      console.log(Date.now(), TsubasaService.thread[userId][botId].name, response.data.update.card.id);
      if (response.status === 200) {
        if (response.data.update.card.level_up_available_date) {
          TsubasaService.thread[userId][botId].cardInLockTime.push(response.data.update.card);
        } else {
          TsubasaService.thread[userId][botId].cardAvailable.push(response.data.update.card)
        }
        if (TsubasaService.thread[userId][botId].levelOfCard[response.data.update.card.id]) {

          TsubasaService.thread[userId][botId].levelOfCard[response.data.update.card.id] = TsubasaService.thread[userId][botId].levelOfCard[response.data.update.card.id].filter(c => {
            if (response.data.update.card.level >= c.unlock_card_level && !c.level_up_available_date) {
              TsubasaService.thread[userId][botId].cardAvailable.push(c);
            }
            return response.data.update.card.level < c.unlock_card_level
          });
        }

        TsubasaService.thread[userId][botId].cardInLockTime = TsubasaService.thread[userId][botId].cardInLockTime.filter(card => {
          if (Date.now() >= (card.level_up_available_date * 1000) + 360000) {
            TsubasaService.thread[userId][botId].cardAvailable.push(card);
            return false;
          }
          return true;
        });

        TsubasaService.thread[userId][botId].cardAvailable.sort((a, b) => {
          return a.cost - b.cost
        })
        return {
          success: true,
          user: response.data.game_data.user,
        };
      }
      throw BadRequestError("Error when upgrade card");
    } catch (e) {
      console.error(e.message);
    }
  }

  static getCardCanUpdate({ userId, botId, card_info }) {
    card_info.forEach(info => {
      info.card_list.forEach(card => {
        if (card.unlocked && card.level_up_available_date * 1000 <= Date.now()) {
          TsubasaService.thread[userId][botId].cardAvailable.push({ ...card });
        } else {
          if (card.unlock_card_id !== "Friend") {
            if (!TsubasaService.thread[userId][botId].levelOfCard[card.unlock_card_id]) {
              TsubasaService.thread[userId][botId].levelOfCard[card.unlock_card_id] = [card]
            } else {
              TsubasaService.thread[userId][botId].levelOfCard[card.unlock_card_id].push(card);
            }
          }
        }
        if (Date.now() < card.level_up_available_date * 1000) {
          TsubasaService.thread[userId][botId].cardInLockTime.push(card);
        }
      })
    })
    TsubasaService.thread[userId][botId].cardAvailable.sort((a, b) => {
      return a.cost - b.cost;
    })
  }

  static async checkStatusProxy({ proxy_host, axiosInstance }) {
    const response = await axiosInstance.get('https://api.ipify.org?format=json');
    if (response.status === 200) {
      return response.data.ip === proxy_host;
    }
    return false;
  }
  static async startApp({ userId, bot_id, bot_init_data, axiosInstance }) {
    const response = await axiosInstance.post("https://app.ton.tsubasa-rivals.com/api/start", {
      lang_code: "en",
      initData: bot_init_data,
    })
    const user = TsubasaService.parseUser(bot_init_data);
    if (response.status == 200) {
      if (!TsubasaService.thread[userId]) {
        TsubasaService.thread[userId] = {}
      }
      TsubasaService.thread[userId][bot_id] = {
        name: user.last_name + " " + user.first_name,
        status: 0,
        total_coins: response.data.game_data.user.total_coins,
        interval: null,
        "x-masterhash": response.data.master_hash,
        levelOfCard: {},
        cardInLockTime: [],
        cardAvailable: [],
      }

      if (response.status == 200) {
        if (response.data.user_daily_reward.consecutive_count == 0) {
          TsubasaService.thread[userId][bot_id].next_claim = Date.now() / 1000;
        } else {
          let currentTime = Date.now() / 1000;
          let lastClaim = response.data.user_daily_reward.last_update + 86400;
          if (currentTime > lastClaim) {
            TsubasaService.thread[userId][bot_id].next_claim = currentTime;
          } else {
            TsubasaService.thread[userId][bot_id].next_claim = lastClaim;
          }
        }
      }
      await botModel.findOneAndUpdate({
        _id: bot_id
      }, {
        bot_data: {
          ...response.data.game_data.user
        }
      })

      return {
        success: true,
        master_hash: response.data.master_hash,
        user: response.data.game_data.user,
        task_info: response.data.task_info,
        card_info: response.data.card_info,
      }
    } else {
      throw BadRequestError("Error when start app")
    }
  }

  static async run({ userId = null, botId = null }) {
    if (TsubasaService.thread[userId] && TsubasaService.thread[userId][botId] && !(TsubasaService.thread[userId][botId].status === 2)) {
      return {
        success: false,
        message: "Bot is running"
      }
    }

    const holderBot = await botModel.findOne({
      bot_of_user: userId,
      _id: botId
    });
    if (!holderBot) {
      return apiResponse({ code: 404, message: "Bot not found" });
    }
    const { bot_proxy, bot_init_data } = holderBot;
    const options = {
      headers: TsubasaService.headers,
    }
    if (bot_proxy !== "http://admin:admin@0.0.0.0:0") {
      options.httpsAgent = new HttpsProxyAgent(bot_proxy);
    }
    const axiosInstance = axios.create(options);
    if (bot_proxy !== "http://admin:admin@0.0.0.0:0") {
      const isAliveProxy = await TsubasaService.checkStatusProxy({
        proxy_host: bot_proxy.split('@')[1].split(":")[0],
        axiosInstance
      })
      if (!isAliveProxy) {
        throw BadRequestError("Proxy is not alive");
      }
    }
    const data = await TsubasaService.startApp({
      bot_init_data,
      bot_id: botId,
      userId: userId,
      axiosInstance
    })
    TsubasaService.getCardCanUpdate({ userId, botId, card_info: data.card_info });
    if (data.user.total_coins < TsubasaService.thread[userId][botId].cardAvailable[0].cost) {
      TsubasaService.thread[userId][botId].status = 1;
    }
    async function loopTask() {
      let currentTime = Date.now() / 1000;
      if (TsubasaService.thread[userId][botId].status == 1) {
        if (currentTime > TsubasaService.thread[userId][botId].next_claim) {
          await TsubasaService.claimDaily({ userId, botId, axiosInstance });
          TsubasaService.thread[userId][botId].next_claim += 24 * 60 * 60;
        }
      }
      if (TsubasaService.thread[userId][botId].status === 0) {
        while (TsubasaService.thread[userId][botId].status === 0) {
          const newData = await TsubasaService.upgradeCard({
            userId: userId,
            playerId: data.user.id,
            botId: botId,
            bot_init_data,
            axiosInstance
          })

          if (typeof (newData) === "object" && newData.hasOwnProperty("user")) {
            TsubasaService.thread[userId][botId].total_coins = newData.user.total_coins;
            await botModel.findOneAndUpdate({
              _id: botId
            }, {
              bot_data: {
                ...newData.user
              }
            })
          }
          await new Promise(resolve => {
            setTimeout(() => {
              resolve();
            }, 10000);
          })
        }
      } else {
        setTimeout(() => {
          if (TsubasaService.thread[userId][botId].status === 1) {
            TsubasaService.thread[userId][botId].status === 0
            loopTask();
          }
        }, 1000 * 60 * 60 * 3);
      }
    }
    loopTask();
    return {
      success: true,
      data: {
        ...data.user,
        name: TsubasaService.thread[userId][botId].name,
      },
      status: TsubasaService.thread[userId][botId].status,
    }
  }
  static async getBot({ userId, botId }) {
    const bot = await botModel.findOne({
      bot_of_user: userId,
      _id: botId
    }).lean()
    const user = TsubasaService.parseUser(bot.bot_init_data)
    return {
      ...bot,
      status: TsubasaService.thread[userId] && TsubasaService.thread[userId][botId] ? TsubasaService.thread[userId][botId].status : 2,
      name: user.last_name + ' ' + user.first_name,
      last_claim: TsubasaService.thread[userId] && TsubasaService.thread[userId][botId] ? TsubasaService.thread[userId][botId].last_claim : null,
    };
  }
  static stopBot({ userId, botId }) {
    if (!TsubasaService.hasOwnProperty('thread') ||
      !TsubasaService.thread.hasOwnProperty(userId) ||
      !TsubasaService.thread[userId].hasOwnProperty(botId)) {
      return {
        success: false,
        status: 0,
        message: "Bot is not running"
      };
    }
    TsubasaService.thread[userId][botId].status = 2;
    return {
      success: true,
      status: TsubasaService.thread[userId][botId].status
    }
  }
  static startBot({ userId, botId }) {
    if (!TsubasaService.thread[userId] && !TsubasaService.thread[userId][botId]) {
      return {
        success: false,
        status: 0,
        message: "Bot is not running"
      }
    }
    TsubasaService.thread[userId][botId].status = 0;
    return {
      success: true,
      status: TsubasaService.thread[userId][botId].status
    }
  }
  static async setBot({ bot_of_user, bot_type, bot_init_data, bot_proxy }) {
    const newBot = await botModel.create({
      bot_of_user,
      bot_type,
      bot_init_data,
      bot_proxy
    })
    if (newBot) {
      return newBot;
    }
    throw new Error(`Bot ${bot_of_user} can not be created`);
  }
  static async updateBot({ bot_of_user, bot_type, bot_init_data, bot_proxy }) {
    const updatedBot = await botModel.findOneAndUpdate({
      bot_of_user,
      bot_type
    }, {
      bot_init_data,
      bot_proxy
    })
    if (updatedBot) {
      return updatedBot;
    }
    throw new Error(`Bot ${bot_of_user} can not be updated`);
  }
  static async getBots({ userId }) {
    const bots = await botModel.find({
      bot_of_user: userId
    }).lean()

    return bots.map(bot => {
      const user = TsubasaService.parseUser(bot.bot_init_data)
      return {
        ...bot,
        status: (TsubasaService.thread[userId] && TsubasaService.thread[userId][bot._id]) ? TsubasaService.thread[userId][bot._id].status : 2,
        name: user.last_name + " " + user.first_name
      }
    });
  }
  static async setDailyCombo({ userId, daily_combo }) {
    const holderUser = await userModel.findOne({
      _id: userId
    })
    if (!holderUser) {
      throw new NotFoundError("User not found");
    }
    if (holderUser.role !== "admin") {
      throw new BadRequestError("You are not admin")
    }
    TsubasaService.daily_combo = [...daily_combo];
    return TsubasaService.daily_combo;
  }
}
module.exports = TsubasaService;
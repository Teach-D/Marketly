import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { REDIS_KEYS } from '../common/constants/redis-keys';
import { buildDateRange, buildMonthRange, toDateStr, toMonthStr } from '../common/utils/date.util';

@Injectable()
export class StatsService {
  constructor(private readonly redis: RedisService) {}

  async getSummary() {
    const today = toDateStr(new Date());
    const thisMonth = toMonthStr(new Date());

    const keys = [
      REDIS_KEYS.statsRevenueDaily(today),
      REDIS_KEYS.statsOrdersDaily(today),
      REDIS_KEYS.statsUsersDaily(today),
      REDIS_KEYS.statsRevenueMonthly(thisMonth),
      REDIS_KEYS.statsOrdersMonthly(thisMonth),
      REDIS_KEYS.statsUsersMonthly(thisMonth),
    ];

    const values = await this.redis.mGet(keys);
    const parse = (v: string | null) => (v ? parseFloat(v) : 0);

    return {
      today: {
        revenue: parse(values[0]),
        orders: parse(values[1]),
        newUsers: parse(values[2]),
      },
      thisMonth: {
        revenue: parse(values[3]),
        orders: parse(values[4]),
        newUsers: parse(values[5]),
      },
    };
  }

  async getDailyStats(days: number) {
    const dates = buildDateRange(days);
    const revenueKeys = dates.map(REDIS_KEYS.statsRevenueDaily);
    const orderKeys = dates.map(REDIS_KEYS.statsOrdersDaily);

    const [revenues, orders] = await Promise.all([
      this.redis.mGet(revenueKeys),
      this.redis.mGet(orderKeys),
    ]);

    const parse = (v: string | null) => (v ? parseFloat(v) : 0);

    return dates.map((date, i) => ({
      date,
      revenue: parse(revenues[i]),
      orders: parse(orders[i]),
    }));
  }

  async getMonthlyStats(months: number) {
    const monthList = buildMonthRange(months);
    const revenueKeys = monthList.map(REDIS_KEYS.statsRevenueMonthly);
    const orderKeys = monthList.map(REDIS_KEYS.statsOrdersMonthly);

    const [revenues, orders] = await Promise.all([
      this.redis.mGet(revenueKeys),
      this.redis.mGet(orderKeys),
    ]);

    const parse = (v: string | null) => (v ? parseFloat(v) : 0);

    return monthList.map((month, i) => ({
      month,
      revenue: parse(revenues[i]),
      orders: parse(orders[i]),
    }));
  }
}

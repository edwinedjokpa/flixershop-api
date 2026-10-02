import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpClient } from '@nestjs/http-client';
import { type Cache } from 'cache-manager';

import { Money } from '@/shared/domain/value-objects/money.vo.js';
import { Currency } from '@/shared/domain/value-objects/currency.vo.js';
import { CurrencyExchangePort } from '../../application/ports/currency-exchange.port.js';
import {
  CurrencyExchangeApiException,
  CurrencyExchangeProviderException,
} from '@/shared/domain/exceptions/currency.exception.js';

interface ExchangeRateApiResponse {
  result: 'success' | 'error';
  error_type?: string;
  base_code?: string;
  target_code?: string;
  conversion_rate?: number;
}

@Injectable()
export class ExchangeRateAdapter implements CurrencyExchangePort {
  private readonly baseUrl = 'https://v6.exchangerate-api.com/v6';
  private readonly apiKey: string;

  private readonly cacheTTLMs = 60 * 60 * 1000;
  private readonly cachePrefix = 'currency-exchange-rate';

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly httpService: HttpClient,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'EXCHANGE_RATE_API_KEY',
    );
  }

  async convert(money: Money, targetCurrency: Currency): Promise<Money> {
    if (money.currency.equals(targetCurrency)) {
      return money;
    }

    const rate = await this.getExchangeRate(money.currency, targetCurrency);

    return Money.create(
      money.amount.mul(rate).toString(),
      targetCurrency.value,
    );
  }

  private async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    const cacheKey = this.getCacheKey(from, to);

    const cachedData = await this.cacheManager.get<number>(cacheKey);
    if (cachedData !== undefined && cachedData !== null) {
      return cachedData;
    }

    const url = new URL(
      `${this.apiKey}/pair/${from.value}/${to.value}`,
      `${this.baseUrl}/`,
    ).toString();

    const { data, status } =
      await this.httpService.get<ExchangeRateApiResponse>(url);
    if (status < 200 || status >= 300) {
      throw new CurrencyExchangeApiException({
        statusCode: status,
        from: from.value,
        to: to.value,
      });
    }

    if (data.result !== 'success' || data.conversion_rate === undefined) {
      throw new CurrencyExchangeProviderException({
        from: from.value,
        to: to.value,
        errorType: data.error_type ?? 'unknown error',
      });
    }

    await this.cacheManager.set(
      cacheKey,
      data.conversion_rate,
      this.cacheTTLMs,
    );

    return data.conversion_rate;
  }

  private getCacheKey(from: Currency, to: Currency): string {
    return `${this.cachePrefix}:${from.value}:${to.value}`;
  }
}

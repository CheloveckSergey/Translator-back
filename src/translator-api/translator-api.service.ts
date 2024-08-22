import { Injectable } from '@nestjs/common';
import axios from 'axios';

type TranslatorResponse = { 
  detectedLanguage: {
    language: string,
    score: number,
  },
  translations: {
    text: string,
    to: string,
  }[]
}[]

@Injectable()
export class TranslatorApiService {

  async translate(input: string) {
    const options = {
      method: 'POST',
      url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
      params: {
        to: 'ru',
        'api-version': '3.0',
        profanityAction: 'NoAction',
        textType: 'plain'
      },
      headers: {
        'x-rapidapi-key': 'cd2dfebd2cmsh0163ccffc61b51ep10bf7bjsnbe47d2776186',
        'x-rapidapi-host': 'microsoft-translator-text.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: [
        {
          Text: input,
        }
      ]
    };
    
    try {
      const response = await axios.request<TranslatorResponse>(options);
      return response.data[0].translations[0].text;
    } catch (error) {
      throw new Error('ХУЙНЯ В ТРАНСЛАТОРЕ')
    }
  }
}

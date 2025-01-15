import { Injectable } from '@nestjs/common';
import axios from 'axios';

interface TranslatorResponse { 
  code: number,
  texts: string[],
  tl: string,
}

@Injectable()
export class TranslatorApiService {

  constructor() {}

  async translate(input: string): Promise<string> {
    const options = {
      method: 'POST',
      url: 'https://ai-translate.p.rapidapi.com/translate',
      headers: {
        'x-rapidapi-key': 'cd2dfebd2cmsh0163ccffc61b51ep10bf7bjsnbe47d2776186',
        'x-rapidapi-host': 'ai-translate.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        texts: [
          input,
        ],
        tl: 'ru',
        sl: 'en'
      }
    };
    
    try {
      const response = await axios.request<TranslatorResponse>(options);
      console.log(response.data.texts[0]);
      return response.data.texts[0];
    } catch (error) {
      console.log(error);
      throw new Error('ХУЙНЯ В ТРАНСЛАТОРЕ')
    }
  }
}

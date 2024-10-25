import { Injectable } from '@nestjs/common';
import axios from 'axios';

// type TranslatorResponse = { 
//   detectedLanguage: {
//     language: string,
//     score: number,
//   },
//   translations: {
//     text: string,
//     to: string,
//   }[]
// }[]

interface TranslatorResponse { 
  texts: string,
}[]

@Injectable()
export class TranslatorApiService {

  constructor() {}

  async translate(input: string) {
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
      console.log(response.data.texts);
      return response.data.texts;
    } catch (error) {
      console.log(error);
      throw new Error('ХУЙНЯ В ТРАНСЛАТОРЕ')
    }
  }
}

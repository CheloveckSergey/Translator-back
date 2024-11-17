import { Injectable } from "@nestjs/common";
import * as uuid from 'uuid';
import * as path from 'path';
import { writeFile } from 'fs/promises';
import { unlink } from "fs";

export class MyImage {
  file: Express.Multer.File;
  name: string;

  constructor(file: Express.Multer.File) {
    this.file = file;
    this.name = uuid.v4() + '.jpg';
  }

  async save() {
    await writeFile(path.resolve('src', 'static', 'images', this.name), this.file.buffer);
  }

  static async delete(name: string) {
    unlink(path.resolve('src', 'static', name), (error) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log('Не удалено');
    });
  }
}

@Injectable()
export class ServiceService {}

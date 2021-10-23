import { Module } from "@nestjs/common";

import { BrowserController } from "./controllers/browser.controller";

const controllers = [BrowserController];

@Module({
  controllers,
})
export class HttpModule {}

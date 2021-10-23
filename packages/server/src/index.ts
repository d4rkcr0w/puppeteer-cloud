/* eslint-disable max-classes-per-file */

import { I18nextModule } from "@nest-boost/i18next";
import { LoggerModule } from "@nest-boost/logger";
import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import path from "path";

import { HttpModule } from "./app/http/http.module";

export interface StartAgentOptions {
  port: number;
  executablePath?: string;
  profileBasePath?: string;
}

export async function startAgent(options: StartAgentOptions): Promise<void> {
  const executablePath =
    options?.executablePath ||
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

  const profileBasePath =
    options?.profileBasePath || path.join(process.cwd(), "profiles");

  const providers = [
    {
      provide: "executablePath",
      useValue: executablePath,
    },
    {
      provide: "profileBasePath",
      useValue: profileBasePath,
    },
  ];

  @Global()
  @Module({
    providers,
    exports: providers,
  })
  class OptionModule {}

  @Module({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, expandVariables: true }),
      I18nextModule.register({
        ns: ["common", "validation", "property"],
        defaultNS: "common",
      }),
      LoggerModule.register(),
      OptionModule,
      HttpModule,
    ],
  })
  class AppModule {}

  const app = await NestFactory.create(AppModule);

  await app.listen(options.port);
}

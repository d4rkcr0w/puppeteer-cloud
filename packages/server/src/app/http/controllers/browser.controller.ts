import { PinoLogger } from "@nest-boost/logger";
import { Body, Controller, Inject, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import httpProxy from "http-proxy";
import ip from "ip";
import _ from "lodash";
import path from "path";
import puppeteer from "puppeteer";

@Controller("/browsers")
export class BrowserController {
  @Inject("executablePath")
  private readonly executablePath: string;

  @Inject("profileBasePath")
  private readonly profileBasePath: string;

  constructor(
    readonly logger: PinoLogger,
    readonly configService: ConfigService
  ) {
    this.logger.setContext(this.constructor.name);
    return this;
  }

  @Post("/launch")
  async launch(
    @Body("headless") headless: boolean,
    @Body("profile") profile: string,
    @Body("args") args: string[] = []
  ): Promise<{ wsEndpoint: string }> {
    const ipAddress = ip.address();
    const port = _.random(30000, 60000);

    const browser = await puppeteer.launch({
      headless,
      executablePath: this.executablePath,
      args: [
        `--user-data-dir=${path.normalize(
          path.join(
            this.configService.get(
              this.profileBasePath,
              path.join(process.cwd(), "profiles")
            ),
            profile || ""
          )
        )}`,
        ...args,
      ],
    });

    const wsEndpoint = browser.wsEndpoint();
    const wsEndpointUrl = new URL(wsEndpoint);

    const server = httpProxy.createServer({
      target: wsEndpoint,
      ws: true,
      localAddress: ipAddress,
    });

    browser.on("close", () => {
      server.close();
    });

    server.on("close", () => {
      browser.close();
    });

    server.listen(port);

    wsEndpointUrl.host = ipAddress;
    wsEndpointUrl.port = String(port);

    return { wsEndpoint: wsEndpointUrl.toString() };
  }
}

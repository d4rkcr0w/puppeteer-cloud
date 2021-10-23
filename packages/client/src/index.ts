import axios from "axios";
import puppeteer, { Browser, BrowserLaunchArgumentOptions } from "puppeteer";

puppeteer.launch();

export interface LaunchOptions extends BrowserLaunchArgumentOptions {
  serverUrl: string;
  profile: string;
}

export async function launch(options: LaunchOptions): Promise<Browser> {
  const response = await axios.post<{ wsEndpoint: string }>(
    "/browsers/launch",
    options,
    {
      baseURL: options.serverUrl,
    }
  );

  return await puppeteer.connect({
    browserWSEndpoint: response.data.wsEndpoint,
    ignoreHTTPSErrors: true,
  });
}

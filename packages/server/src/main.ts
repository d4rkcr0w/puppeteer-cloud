import "source-map-support/register";

import { startAgent } from ".";

startAgent({
  port: +(process.env.PORT || 5000),
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

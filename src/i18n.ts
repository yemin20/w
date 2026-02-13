import { getRequestConfig } from "next-intl/server";
import tr from "./app/messages/tr.json";

export default getRequestConfig(async () => {
  return {
    locale: "tr",
    messages: tr
  };
});

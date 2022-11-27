import { defaults as tsJestPresets } from "ts-jest/presets";

export default {
  preset: "ts-jest",
  transform: { ...tsJestPresets.transform },
  testMatch: ["./**/*.(test|spec).ts"]
}
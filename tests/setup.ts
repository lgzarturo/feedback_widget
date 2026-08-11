import { mock } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { createThreeModuleMock } from "./animations/helpers/three-mock";

GlobalRegistrator.register();

mock.module("three", () => createThreeModuleMock());

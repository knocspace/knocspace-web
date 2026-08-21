import { defineConfig, defaultClientConditions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { seedDesignPlugin } from "@seed-design/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), seedDesignPlugin()],
  resolve: {
    // SEED 컴포넌트가 recipes/*.layered.mjs 를 집게 한다.
    // Vite 6+ 에서 conditions 는 기본값을 덮어쓰므로 반드시 펼쳐서 넣는다.
    conditions: [...defaultClientConditions, "seed-layered"],
  },
});

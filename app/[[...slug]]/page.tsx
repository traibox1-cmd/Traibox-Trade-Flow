import { Providers } from "../providers";
import { ClientRouter } from "../client-router";

export default function Page() {
  return (
    <Providers>
      <ClientRouter />
    </Providers>
  );
}

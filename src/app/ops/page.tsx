import { redirectFromOpsEntry } from "@/lib/ops/auth/guards";

export default async function OpsPage() {
  await redirectFromOpsEntry();
}

import { verifyOrUpdateNxCloudClient } from '../../nx-cloud/update-manager';
import { getCloudOptions } from '../../nx-cloud/utilities/get-cloud-options';
import { handleErrors } from '../../utils/params';

export interface LoginArgs {
  nxCloudUrl?: string;
  verbose?: boolean;
}

export function loginHandler(args: LoginArgs): Promise<number> {
  if (args.verbose) {
    process.env.NX_VERBOSE_LOGGING = 'true';
  }
  const isVerbose = process.env.NX_VERBOSE_LOGGING === 'true';

  if (args.nxCloudUrl) {
    process.env.NX_CLOUD_LOGIN_URL = args.nxCloudUrl;
  }

  return handleErrors(isVerbose, async () => {
    const nxCloudClient = (await verifyOrUpdateNxCloudClient(getCloudOptions()))
      .nxCloudClient;
    await nxCloudClient.commands.login();
  });
}

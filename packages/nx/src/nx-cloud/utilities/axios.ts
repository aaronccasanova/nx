import { AxiosRequestConfig } from 'axios';
import { join } from 'path';
import {
  ACCESS_TOKEN,
  NX_CLOUD_NO_TIMEOUTS,
  UNLIMITED_TIMEOUT,
} from './environment';
import { CloudTaskRunnerOptions } from '../nx-cloud-tasks-runner-shell';

const axios = require('axios');

export function createApiAxiosInstance(options: CloudTaskRunnerOptions) {
  let axiosConfigBuilder = (axiosConfig: AxiosRequestConfig) => axiosConfig;
  const baseUrl =
    process.env.NX_CLOUD_API || options.url || 'https://cloud.nx.app';
  const accessToken = ACCESS_TOKEN ? ACCESS_TOKEN : options.accessToken!;
  const nxCloudId = options.nxCloudId;

  // TODO(lourw): Update message with NxCloudId once it is supported
  if (!accessToken && !nxCloudId) {
    throw new Error(
      `Unable to authenticate. Please connect your workspace to Nx Cloud to define a valid Nx Cloud ID. If you are in a CI context, please set the NX_CLOUD_ACCESS_TOKEN environment variable or define an access token in your nx.json.`
    );
  }

  if (options.customProxyConfigPath) {
    const { nxCloudProxyConfig } = require(join(
      process.cwd(),
      options.customProxyConfigPath
    ));
    axiosConfigBuilder = nxCloudProxyConfig ?? axiosConfigBuilder;
  }

  return axios.create(
    axiosConfigBuilder({
      baseURL: baseUrl,
      timeout: NX_CLOUD_NO_TIMEOUTS ? UNLIMITED_TIMEOUT : 10000,
      headers: { authorization: accessToken },
    })
  );
}

import MOULAGA_CONSTANTS from "../constants";

interface ResourceIdType {
  baseUrl: string;
  path: string;
  orgId: string;
  role: string;
  extraData: string;
}

function resourceIdFactory(
  baseUrl: string, 
  path: string, 
  orgId: string = "", 
  role: string = MOULAGA_CONSTANTS.CONSUMER_ROLE, 
  extraData: string = ""
): ResourceIdType {
  return {baseUrl, path, orgId, role, extraData} as const;
}

export default resourceIdFactory;
export { ResourceIdType };
const {
  mapping,
  getProperties,
  enableBLOB,
  defText,
  defTextVector,
  defNumber,
  defNumberVector,
  defSwitch,
  defSwitchVector,
  defLight,
  defLightVector,
  defBLOB,
  defBLOBVector,
  message,
  delProperty,
  oneBLOB,
  setBLOBVector,
  oneText,
  setTextVector,
  oneNumber,
  setNumberVector,
  oneSwitch,
  setSwitchVector,
  oneLight,
  setLightVector,
  newTextVector,
  newNumberVector,
  newSwitchVector,
} = require("./models");

const {
  INDIClient,
} = require("./client");

const IPS_IDLE = "Idle";
const IPS_OK = "Ok";
const IPS_BUSY = "Busy";
const IPS_ALERT = "Alert";

const ISS_OFF = "Off";
const ISS_ON = "On";

const ISR_1OFMANY = "OneOfMany";
const ISR_ATMOST1 = "AtMostOne";
const ISR_NOFMANY = "AnyOfMany";

const IP_RO = "ro";
const IP_WO = "wo";
const IP_RW = "rw";

const B_NEVER = "Never";
const B_ALSO = "Also";
const B_ONLY = "Only";

module.exports = {
  IPS_IDLE,
  IPS_OK,
  IPS_BUSY,
  IPS_ALERT,
  ISS_OFF,
  ISS_ON,
  ISR_1OFMANY,
  ISR_ATMOST1,
  ISR_NOFMANY,
  IP_RO,
  IP_WO,
  IP_RW,
  B_NEVER,
  B_ALSO,
  B_ONLY,
  IPS_IDLE,
  IPS_IDLE,
  IPS_IDLE,

  getProperties,
  enableBLOB,
  defText,
  defTextVector,
  defNumber,
  defNumberVector,
  defSwitch,
  defSwitchVector,
  defLight,
  defLightVector,
  defBLOB,
  defBLOBVector,
  message,
  delProperty,
  oneBLOB,
  setBLOBVector,
  oneText,
  setTextVector,
  oneNumber,
  setNumberVector,
  oneSwitch,
  setSwitchVector,
  oneLight,
  setLightVector,
  newTextVector,
  newNumberVector,
  newSwitchVector,

  mapping,

  INDIClient,
};

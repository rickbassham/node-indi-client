const xmlbuilder = require("xmlbuilder2");
const moment = require("moment");

const strOrNull = (obj, prop) => {
  return obj[prop] || null;
};

const numOrNull = (obj, prop) => {
  return obj[prop] ? Number(obj[prop]) : null;
};

const valOrList = (obj, prop) => {
  let val = obj[prop] || [];
  if (Array.isArray(val))
    return val;

  return [val];
};

const cleanNum = (val) => {
  if (val === undefined || val === null) {
    return null;
  }

  let clean = Number(val);

  if (Number.isNaN(clean)) {
    return null;
  }

  return clean;
}

const cleanStr = (val) => {
  return val ? String(val) : null;
}

const cleanTimestamp = (val) => {
  if (val instanceof Date) {
    return moment(val).isValid() ? val : null;
  }

  val = val ? String(val) : null;

  if (!val) {
    return null;
  }

  const d = moment.utc(val, true);

  if (!d.isValid()) {
    return null;
  }

  return d.toDate();
}

const tsToStr = (val) => {
  if (!val) {
    return null;
  }

  return moment(val).utc().format("YYYY-MM-DDTHH:mm:ss.SSS");
};

const serializeXML = (obj) => {
  return xmlbuilder.create(obj).end({ headless: true });
}

const mapping = {};

class getProperties {
  constructor(device, name) {
    this.version = "1.7";
    this.device = cleanStr(device);
    this.name = cleanStr(name);
  }

  static fromJSON(obj) {
    return new getProperties(obj.device, obj.name);
  }

  toXML() {
    return serializeXML({
      getProperties: {
        '@version': this.version,
        '@device': this.device,
        '@name': this.name,
      }
    });
  }
}

class enableBLOB {
  constructor(device, name, value) {
    this.device = cleanStr(device);
    this.name = cleanStr(name);
    this.value = cleanStr(value);
  }

  static fromJSON(obj) {
    return new enableBLOB(obj.device, obj.name, obj.value);
  }

  toXML() {
    return serializeXML({
      enableBLOB: {
        '@device': this.device,
        '@name': this.name,
        '#': this.value,
      }
    });
  }
}

class defText {
  constructor(name, label, value) {
    this.name = cleanStr(name);
    this.label = cleanStr(label);
    this.value = cleanStr(value);
  }
}

class defTextVector {
  constructor(device, name, label, group, state, perm, timeout, timestamp, message, texts) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.label = cleanStr(label)
    this.group = cleanStr(group)
    this.state = cleanStr(state)
    this.perm = cleanStr(perm)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!texts) {
      texts = [];
    }

    this.texts = texts.map(item => new defText(item.name, item.label, item.value));
  }

  toXML() {
    const texts = this.texts || [];

    return serializeXML({
      defTextVector: {
        '@device': this.device,
        '@name': this.name,
        '@label': this.label,
        '@group': this.group,
        '@state': this.state,
        '@perm': this.perm,
        '@timeout': this.timeout,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
        'defText': texts.map(t => {
          return {
            '@name': t.name,
            '@label': t.label,
            '#': t.value,
          }
        }),
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.defTextVector;

    return new defTextVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@label"),
      strOrNull(root, "@group"),
      strOrNull(root, "@state"),
      strOrNull(root, "@perm"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "defText").map(item => {
        return new defText(
          strOrNull(item, "@name"),
          strOrNull(item, "@label"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["defTextVector"] = defTextVector;

class defNumber {
  constructor(name, label, format, min, max, step, value) {
    this.name = cleanStr(name);
    this.label = cleanStr(label);
    this.format = cleanStr(format);
    this.min = cleanNum(min);
    this.max = cleanNum(max);
    this.step = cleanNum(step);
    this.value = cleanNum(value);
  }
}

class defNumberVector {
  constructor(device, name, label, group, state, perm, timeout, timestamp, message, numbers) {
    this.device = cleanStr(device);
    this.name = cleanStr(name);
    this.label = cleanStr(label);
    this.group = cleanStr(group);
    this.state = cleanStr(state);
    this.perm = cleanStr(perm);
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp);
    this.message = cleanStr(message);

    if (!numbers) {
      numbers = [];
    }

    this.numbers = numbers.map(item =>
      new defNumber(item.name, item.label, item.format, item.min, item.max, item.step, item.value)
    );
  }

  toXML() {
    const numbers = this.numbers || [];

    return serializeXML({
      defNumberVector: {
        '@device': this.device,
        '@name': this.name,
        '@label': this.label,
        '@group': this.group,
        '@state': this.state,
        '@perm': this.perm,
        '@timeout': this.timeout,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
        'defNumber': numbers.map(t => {
          return {
            '@name': t.name,
            '@label': t.label,
            '@format': t.format,
            '@min': t.min,
            '@max': t.max,
            '@step': t.step,
            '#': t.value,
          }
        }),
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.defNumberVector;

    return new defNumberVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@label"),
      strOrNull(root, "@group"),
      strOrNull(root, "@state"),
      strOrNull(root, "@perm"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "defNumber").map(item => {
        return new defNumber(
          strOrNull(item, "@name"),
          strOrNull(item, "@label"),
          strOrNull(item, "@format"),
          numOrNull(item, "@min"),
          numOrNull(item, "@max"),
          numOrNull(item, "@step"),
          numOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["defNumberVector"] = defNumberVector;

class defSwitch {
  constructor(name, label, value) {
    this.name = cleanStr(name);
    this.label = cleanStr(label);
    this.value = cleanStr(value);
  }
}

class defSwitchVector {
  constructor(device, name, label, group, state, perm, rule, timeout, timestamp, message, switches) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.label = cleanStr(label)
    this.group = cleanStr(group)
    this.state = cleanStr(state)
    this.perm = cleanStr(perm)
    this.rule = cleanStr(rule)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!switches) {
      switches = [];
    }

    this.switches = switches.map(item => new defSwitch(item.name, item.label, item.value));
  }

  toXML() {
    const switches = this.switches || [];

    return serializeXML({
      defSwitchVector: {
        '@device': this.device,
        '@name': this.name,
        '@label': this.label,
        '@group': this.group,
        '@state': this.state,
        '@perm': this.perm,
        '@rule': this.rule,
        '@timeout': this.timeout,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
        'defSwitch': switches.map(t => {
          return {
            '@name': t.name,
            '@label': t.label,
            '#': t.value,
          }
        }),
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.defSwitchVector;

    return new defSwitchVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@label"),
      strOrNull(root, "@group"),
      strOrNull(root, "@state"),
      strOrNull(root, "@perm"),
      strOrNull(root, "@rule"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "defSwitch").map(item => {
        return new defSwitch(
          strOrNull(item, "@name"),
          strOrNull(item, "@label"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["defSwitchVector"] = defSwitchVector;

class defLight {
  constructor(name, label, value) {
    this.name = cleanStr(name);
    this.label = cleanStr(label);
    this.value = cleanStr(value);
  }
}

class defLightVector {
  constructor(device, name, label, group, state, timeout, timestamp, message, lights) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.label = cleanStr(label)
    this.group = cleanStr(group)
    this.state = cleanStr(state)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!lights) {
      lights = [];
    }

    this.lights = lights.map(item => new defLight(item.name, item.label, item.value));
  }

  toXML() {
    const lights = this.lights || [];

    return serializeXML({
      defLightVector: {
        '@device': this.device,
        '@name': this.name,
        '@label': this.label,
        '@group': this.group,
        '@state': this.state,
        '@timeout': this.timeout,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
        'defLight': lights.map(t => {
          return {
            '@name': t.name,
            '@label': t.label,
            '#': t.value,
          }
        }),
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.defLightVector;

    return new defLightVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@label"),
      strOrNull(root, "@group"),
      strOrNull(root, "@state"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "defLight").map(item => {
        return new defLight(
          strOrNull(item, "@name"),
          strOrNull(item, "@label"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["defLightVector"] = defLightVector;

class defBLOB {
  constructor(name, label) {
    this.name = cleanStr(name);
    this.label = cleanStr(label);
  }
}

class defBLOBVector {
  constructor(device, name, label, group, state, perm, timeout, timestamp, message, blobs) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.label = cleanStr(label)
    this.group = cleanStr(group)
    this.state = cleanStr(state)
    this.perm = cleanStr(perm)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!blobs) {
      blobs = [];
    }

    this.blobs = blobs.map(item => new defBLOB(item.name, item.label));
  }

  toXML() {
    const blobs = this.blobs || [];

    return serializeXML({
      defBLOBVector: {
        '@device': this.device,
        '@name': this.name,
        '@label': this.label,
        '@group': this.group,
        '@state': this.state,
        '@perm': this.perm,
        '@timeout': this.timeout,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
        'defBLOB': blobs.map(t => {
          return {
            '@name': t.name,
            '@label': t.label,
          }
        }),
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.defBLOBVector;

    return new defBLOBVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@label"),
      strOrNull(root, "@group"),
      strOrNull(root, "@state"),
      strOrNull(root, "@perm"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "defBLOB").map(item => {
        return new defBLOB(
          strOrNull(item, "@name"),
          strOrNull(item, "@label"),
        )
      }),
    )
  }
}
mapping["defBLOBVector"] = defBLOBVector;

class message {
  constructor(device, timestamp, message) {
    this.device = cleanStr(device)
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)
  }

  toXML() {
    return serializeXML({
      message: {
        '@device': this.device,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.message;

    return new message(
      strOrNull(root, "@device"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
    )
  }
}
mapping["message"] = message;

class delProperty {
  constructor(device, name, timestamp, message) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)
  }

  toXML() {
    return serializeXML({
      delProperty: {
        '@device': this.device,
        '@name': this.name,
        '@timestamp': tsToStr(this.timestamp),
        '@message': this.message,
      }
    });
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.delProperty;

    return new delProperty(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
    )
  }
}
mapping["delProperty"] = delProperty;

class oneBLOB {
  constructor(name, size, enclen, format, value) {
    this.name = cleanStr(name);
    this.size = cleanNum(size);
    this.enclen = cleanNum(enclen);
    this.format = cleanStr(format);
    this.value = cleanStr(value).replace(/\s+/g, '');
  }
}

class setBLOBVector {
  constructor(device, name, state, timeout, timestamp, message, blobs) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.state = cleanStr(state)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!blobs) {
      blobs = [];
    }

    this.blobs = blobs.map(item => new oneBLOB(item.name, item.size, item.enclen, item.format, item.value));
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.setBLOBVector;

    return new setBLOBVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@state"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "oneBLOB").map(item => {
        return new oneBLOB(
          strOrNull(item, "@name"),
          strOrNull(item, "@size"),
          strOrNull(item, "@enclen"),
          strOrNull(item, "@format"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["setBLOBVector"] = setBLOBVector;

class oneText {
  constructor(name, value) {
    this.name = cleanStr(name);
    this.value = cleanStr(value);
  }
}

class setTextVector {
  constructor(device, name, state, timeout, timestamp, message, texts) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.state = cleanStr(state)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!texts) {
      texts = [];
    }

    this.texts = texts.map(item => new oneText(item.name, item.value));
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.setTextVector;

    return new setTextVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@state"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "oneText").map(item => {
        return new oneText(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["setTextVector"] = setTextVector;

class oneNumber {
  constructor(name, value) {
    this.name = cleanStr(name);
    this.value = cleanNum(value);
  }
}

class setNumberVector {
  constructor(device, name, state, timeout, timestamp, message, numbers) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.state = cleanStr(state)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!numbers) {
      numbers = [];
    }

    this.numbers = numbers.map(item => new oneNumber(item.name, item.value));
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.setNumberVector;

    return new setNumberVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@state"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "oneNumber").map(item => {
        return new oneNumber(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["setNumberVector"] = setNumberVector;

class oneSwitch {
  constructor(name, value) {
    this.name = cleanStr(name);
    this.value = cleanStr(value);
  }
}

class setSwitchVector {
  constructor(device, name, state, timeout, timestamp, message, switches) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.state = cleanStr(state)
    this.timeout = cleanNum(timeout);
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!switches) {
      switches = [];
    }

    this.switches = switches.map(item => new oneSwitch(item.name, item.value));
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.setSwitchVector;

    return new setSwitchVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@state"),
      numOrNull(root, "@timeout"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "oneSwitch").map(item => {
        return new oneSwitch(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["setSwitchVector"] = setSwitchVector;

class oneLight {
  constructor(name, value) {
    this.name = cleanStr(name);
    this.value = cleanStr(value);
  }
}

class setLightVector {
  constructor(device, name, state, timestamp, message, lights) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.state = cleanStr(state)
    this.timestamp = cleanTimestamp(timestamp)
    this.message = cleanStr(message)

    if (!lights) {
      lights = [];
    }

    this.lights = lights.map(item => new oneLight(item.name, item.value));
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.setLightVector;

    return new setLightVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@state"),
      strOrNull(root, "@timestamp"),
      strOrNull(root, "@message"),
      valOrList(root, "oneLight").map(item => {
        return new oneLight(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }
}
mapping["setLightVector"] = setLightVector;

class newTextVector {
  constructor(device, name, timestamp, texts) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.timestamp = cleanTimestamp(timestamp)

    if (!texts) {
      texts = [];
    }

    this.texts = texts.map(item => new oneText(item.name, item.value));
  }

  static fromJSON(obj) {
    return new newTextVector(obj.device, obj.name, obj.timestamp, obj.texts);
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.newTextVector;

    return new newTextVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@timestamp"),
      valOrList(root, "oneText").map(item => {
        return new oneText(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }

  toXML() {
    const texts = this.texts || [];

    return serializeXML({
      newTextVector: {
        '@device': this.device,
        '@name': this.name,
        '@timestamp': tsToStr(this.timestamp),
        'oneText': texts.map(t => {
          return {
            '@name': t.name,
            '#': t.value,
          }
        }),
      }
    });
  }
}
mapping["newTextVector"] = newTextVector;

class newNumberVector {
  constructor(device, name, timestamp, numbers) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.timestamp = cleanTimestamp(timestamp)

    if (!numbers) {
      numbers = [];
    }

    this.numbers = numbers.map(item => new oneNumber(item.name, item.value));
  }

  static fromJSON(obj) {
    return new newNumberVector(obj.device, obj.name, obj.timestamp, obj.numbers);
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.newNumberVector;

    return new newNumberVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@timestamp"),
      valOrList(root, "oneNumber").map(item => {
        return new oneNumber(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }

  toXML() {
    const numbers = this.numbers || [];

    return serializeXML({
      newNumberVector: {
        '@device': this.device,
        '@name': this.name,
        '@timestamp': tsToStr(this.timestamp),
        'oneNumber': numbers.map(t => {
          return {
            '@name': t.name,
            '#': t.value,
          }
        }),
      }
    });
  }
}
mapping["newNumberVector"] = newNumberVector;

class newSwitchVector {
  constructor(device, name, timestamp, switches) {
    this.device = cleanStr(device)
    this.name = cleanStr(name)
    this.timestamp = cleanTimestamp(timestamp)

    if (!switches) {
      switches = [];
    }

    this.switches = switches.map(item => new oneSwitch(item.name, item.value));
  }

  static fromJSON(obj) {
    return new newSwitchVector(obj.device, obj.name, obj.timestamp, obj.switches);
  }

  static fromXML(xml) {
    const obj = typeof xml === "string" ? xmlbuilder.create(xml).end({ format: 'object' }) : xml;
    const root = obj.newSwitchVector;

    return new newSwitchVector(
      strOrNull(root, "@device"),
      strOrNull(root, "@name"),
      strOrNull(root, "@timestamp"),
      valOrList(root, "oneSwitch").map(item => {
        return new oneSwitch(
          strOrNull(item, "@name"),
          strOrNull(item, "#"),
        )
      }),
    )
  }

  toXML() {
    const switches = this.switches || [];

    return serializeXML({
      newSwitchVector: {
        '@device': this.device,
        '@name': this.name,
        '@timestamp': tsToStr(this.timestamp),
        'oneSwitch': switches.map(t => {
          return {
            '@name': t.name,
            '#': t.value,
          }
        }),
      }
    });
  }
}
mapping["newSwitchVector"] = newSwitchVector;

module.exports = {
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
};

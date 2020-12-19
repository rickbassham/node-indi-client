const net = require("net");
const xmlbuilder = require("xmlbuilder2");
var ReadWriteLock = require('rwlock');
const EventEmitter = require('events');
const sax = require("sax");

const {
  getProperties,
  enableBLOB,
  mapping,
} = require("./models");

class INDIClient extends EventEmitter {
  constructor(host, port) {
    super();

    this._host = host;
    this._port = port;

    this._current = null;
    this._lock = new ReadWriteLock();

    this._parser = null;
    this._conn = new net.Socket();

    this._conn.on("connect", this._connected.bind(this));
    this._conn.on("close", this._closed.bind(this));
  }

  _connected() {
    this._parser = sax.createStream(true, { trim: true });
    this._current = null;

    this._parser.on("opentag", this._openTag.bind(this));
    this._parser.on("closetag", this._closeTag.bind(this));
    this._parser.on("text", this._text.bind(this));
    this._parser.on("cdata", this._cdata.bind(this));
    this._parser.on("error", () => { })

    // needed for sax to think we are still in the same document
    // otherwise we'd need to reallocate and reconnect all the parser
    // functions on every new xml doc that comes through the stream.
    // this is a hack, but works quite well.
    this._parser.write("<fakeRoot>");

    this._conn.pipe(this._parser);

    this.emit("connect");
  }

  _closed() {
    this._parser = null;
    this._current = null;

    this.emit("close");
  }

  _openTag(tag) {
    this._lock.writeLock((release) => {
      if (tag.name !== "fakeRoot") {
        if (!this._current) {
          this._current = { builder: xmlbuilder.create(), name: tag.name };
        }

        this._current.builder = this._current.builder.ele(tag.name, tag.attributes);
      }

      release();
    });
  }

  _text(text) {
    this._lock.writeLock((release) => {
      if (String(text).trim().length > 0)
        this._current.builder = this._current.builder.txt(text);
      release();
    });
  }

  _cdata(cdata) {
    this._lock.writeLock((release) => {
      this._current.builder = this._current.builder.dat(cdata);
      release();
    });
  }

  _closeTag(name) {
    this._lock.writeLock((release) => {
      this._current.builder = this._current.builder.up();

      if (name == this._current.name) {
        const obj = this._current.builder.end();
        let parsed = null;

        const cls = mapping[name];
        if (cls) {
          parsed = cls.fromXML(obj);
        }

        if (parsed) {
          this.emit(name, parsed);
        }

        this._current = null;
      }

      release();
    });
  }

  connect() {
    this._conn.connect(this._port, this._host);
  }

  getProperties(device, name) {
    this.send(new getProperties(device, name));
  }

  enableBLOB(device, name, value) {
    this.send(new enableBLOB(device, name, value));
  }

  send(command) {
    this._conn.write(command.toXML());
  }
}

module.exports.INDIClient = INDIClient;

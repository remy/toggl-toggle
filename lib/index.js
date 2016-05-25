'use strict';
const request = require('request');
const debug = require('debug')('toggl');

module.exports = function (token) {
  if (!token) {
    return Promise.reject(new Error('toggl-toggle requires an API token'));
  }

  return new Toggle(token).toggle();
};

class Toggle {
  constructor(token) {
    this.root = `https://${token}:api_token@www.toggl.com/api/v8/time_entries`;
  }

  toggle() {
    let running = false;
    return this.get('current').then(latest => {
      if (latest.data !== null) {
        running = true;
        return latest.data;
      }

      return this.get().then(res => {
        return res.pop();
      });
    }).then(data => {
      if (running) {
        return this.stop(data.id);
      }

      return this.start({
        'time_entry': {
          description: data.description,
          pid: data.pid,
          'created_with': 'Toggl toggle',
        },
      });
    });
  }

  stop(id) {
    return this.request('put', `${this.root}/${id}/stop`);
  }

  start(data) {
    return this.request('post', `${this.root}/start`, data);
  }

  get(method) {
    return this.request('get', this.root + (method ? '/' + method : ''));
  }

  request(method, url, body) {
    debug('%s %s', method, url, body);
    return new Promise((resolve, reject) => {
      request({
        url,
        method,
        body,
        json: true,
      }, (error, res, body) => {
        debug(error, res, body);
        if (error) {
          return reject(error);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`${res.statusCode}: ${JSON.stringify(body)}`));
        }

        resolve(body);
      });
    });
  }
}

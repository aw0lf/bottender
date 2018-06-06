/* @flow */
import type { SessionStore } from '../session/SessionStore';

import Bot from './Bot';
import TestConnector from './TestConnector';

export default class TestBot extends Bot {
  constructor({
    sessionStore,
    fallbackMethods,
  }: { sessionStore: SessionStore, fallbackMethods?: boolean } = {}) {
    const connector = new TestConnector({ fallbackMethods });
    super({ connector, sessionStore, sync: true });
  }

  async runTests(tests: Array<string>) {
    const client = this.connector.client;
    const requestHandler = this.createRequestHandler();

    const rawEvents = tests.map(t => this._createRawEventFromTest(t));

    // TODO: return data from input and client spy
    const result = [];

    for (let i = 0; i < tests.length; i++) {
      /* eslint-disable no-await-in-loop */
      const test = tests[i];

      try {
        await Promise.resolve(
          requestHandler({
            payload: '__GET_STARTED__',
          })
        );

        client.mockReset();

        await Promise.resolve(requestHandler(rawEvents[i]));

        result.push({
          input: test,
          output: {
            calls: client.calls,
            error: null,
          },
        });

        client.mockReset();
      } catch (err) {
        result.push({
          input: test,
          output: {
            error: err,
          },
        });
      }
      /* eslint-enable no-await-in-loop */
    }

    return result;
  }

  _createRawEventFromTest(test: string) {
    if (/^\/payload /.test(test)) {
      const payload = test.split('/payload ')[1];

      return {
        payload,
      };
    }

    return {
      message: {
        text: test,
      },
    };
  }
}

/* eslint-disable */
import React from 'react';
import initEnvironment from './createRelayEnvironment';
import { fetchQuery, ReactRelayContext } from 'react-relay';

export const withData = (ComposedComponent: any, options: any = {}) => {
  return class WithData extends React.Component {
    static displayName = `WithData(${ComposedComponent.displayName})`;

    static async getInitialProps(ctx: any) {
      let composedInitialProps: any = {};
      // Evaluate the composed component's getInitialProps()
      if (ComposedComponent.getInitialProps) {
        composedInitialProps = await ComposedComponent.getInitialProps(ctx);
      }
      let queryProps = {};
      let queryRecords = {};
      const environment = initEnvironment();

      if (options.query) {
        const variables = composedInitialProps.relayVariables || {};
        // TODO: Consider RelayQueryResponseCache
        // https://github.com/facebook/relay/issues/1687#issuecomment-302931855
        queryProps = await fetchQuery(environment, options.query, variables);
        queryRecords = environment
          .getStore()
          .getSource()
          // @ts-ignore
          .toJSON();
      }

      return {
        ...composedInitialProps,
        ...queryProps,
        queryRecords,
      };
    }

    private environment: any;

    constructor(props: any) {
      super(props);
      this.environment = initEnvironment({
        records: props.queryRecords,
      });
    }

    render() {
      return (
        <ReactRelayContext.Provider
          value={{ environment: this.environment, variables: {} }}
        >
          <ComposedComponent {...this.props} />
        </ReactRelayContext.Provider>
      );
    }
  };
};

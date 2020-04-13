import * as webpack from 'webpack'
import merge from 'webpack-merge'

import { config } from './webpack.common'

module.exports = merge(config, {
  plugins: [
    new webpack.DefinePlugin({
      WEBPACK_DEFINE_COIL_DOMAIN: JSON.stringify('https://staging.coil.com'),
      WEBPACK_DEFINE_REDEEMER_DOMAIN: JSON.stringify(
        'https://staging.coil.com'
      ),
      WEBPACK_DEFINE_SIGNER_DOMAIN: JSON.stringify('https://staging.coil.com')
    })
  ]
})

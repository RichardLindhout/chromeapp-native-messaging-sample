
  (function() {
    'use strict';

    var SUPPORTED = 'bluetooth' in navigator;

    // This allows us to use BluetoothDevice related attributes type in
    // browsers where it is not defined.
    if (!('BluetoothDevice' in window)) {
      window.BluetoothDevice = {};
    }

    /**
     * The `<platinum-bluetooth-device>` element allows you to [discover nearby
     * bluetooth devices][1] thanks to the young [Web Bluetooth API][2]. It is
     * currently only partially implemented in Chrome OS 45 behind the
     * experimental flag `chrome://flags/#enable-web-bluetooth`.
     *
     * `<platinum-bluetooth-device>` is used as a parent element for
     * `<platinum-bluetooth-characteristic>` child elements.
     *
     * For instance, here's how to request a nearby bluetooth device advertising
     * Battery service :
     *
     * ```html
     * <platinum-bluetooth-device
     *     services-filter='["battery_service"]'>
     * </platinum-bluetooth-device>
     * ```
     * ```js
     * button.addEventListener('click', function() {
     *   document.querySelector('platinum-bluetooth-device').request()
     *   .then(function(device) { console.log(device.name); })
     *   .catch(function(error) { console.error(error); });
     * });
     * ```
     *
     * [1]: https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web
     * [2]: https://github.com/WebBluetoothCG/web-bluetooth
     *
     * @hero hero.svg
     * @demo
     */

    Polymer({

      is: 'platinum-bluetooth-device',

      properties: {

        /**
         * Indicates whether the Web Bluetooth API is supported by
         * this browser.
         */
        supported: {
          readOnly: true,
          type: Boolean,
          value: SUPPORTED
        },

        /**
         * Required Bluetooth GATT services filter. You may provide either the
         * full Bluetooth UUID as a string or a short 16- or 32-bit form as
         * integers like 0x180d.
         */
        servicesFilter: {
          type: Array,
          observer: '_servicesFilterChanged'
        },

        /**
         * Internal variable used to cache Bluetooth device.
         */
        _device: {
          type: BluetoothDevice,
          observer: '_deviceChanged'
        },

      },

      /**
      * Update all characteristics when device changes.
       */
      _deviceChanged: function() {
        this._updateCharacteristics();
      },

      /**
       * Reset device when services-filter property is changed.
       */
      _servicesFilterChanged: function() {
        this._device = null;
      },

      /**
       * Set the internal device object on each characteristic child.
       */
      _updateCharacteristics: function() {
        this._characteristics = Polymer.dom(this.$.characteristics).getDistributedNodes();
        for (var i = 0; i < this._characteristics.length; i++) {
          this._characteristics[i]._device = this._device;
        }
      },

      created: function() {
        this._characteristics = [];
      },

      /**
       * Reset device to pick a new device.
       */
      reset: function() {
        this._device = null;
      },

      /**
       * Request a nearby bluetooth device and returns a Promise that will
       * resolve when user picked one Bluetooth device.
       *
       * It must be called on user gesture.
       *
       * @return {Promise<BluetoothDevice>}
       */
      request: function() {
        if (!this.supported) {
          return Promise.reject(new Error('Your browser does not support Bluetooth'));
        }
        if (this._device) {
          this._updateCharacteristics();
          // Resolve promise if user already picked one device.
          return Promise.resolve(this._device);
        }
        if (!this.servicesFilter || this.servicesFilter.length == 0) {
          return Promise.reject(new Error('Please set Bluetooth services filter.'));
        }
        var self = this;
        return navigator.bluetooth.requestDevice({filters:[{services: this.servicesFilter}]})
          .then(function(device) {
            // Cache device for later use.
            self._device = device;
            return self._device;
          });
      },

    });
  })();

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 50000,

  init: function() {
    console.log("App initialized...")
    return App.initWeb3();
  },

    initWeb3: function() {
        // if (typeof web3 !== 'undefined') {
        if (window.ethereum) {
            // If a web3instance is already is already provided by Meta Mask
            // App.web3Provider = web3.currentProvider;
            // web3 = new Web3(web3.currentProvider);
            console.log("MetaMask Installed.");
            App.web3Provider = window.ethereum;
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        } else {
            // Specify default instance if no web3 instance provided
            // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            App.web3Provider = new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/482690ddac7b4c9fabae7cb9c3f75dc1');
            window.web3 = new Web3(window.ethereum);
        }

        return App.initContracts();
    },

  initContracts: function() {
    $.getJSON("CVTTokenSale.json", function(CVTTokenSale) {
      App.contracts.CVTTokenSale = TruffleContract(CVTTokenSale);
      App.contracts.CVTTokenSale.setProvider(App.web3Provider);
      App.contracts.CVTTokenSale.deployed().then(function(CVTTokenSale) {
        console.log("CVTToken Sale Address:", CVTTokenSale.address);
      });
    }).done(function() {
      $.getJSON("CVTToken.json", function(CVTToken) {
        App.contracts.CVTToken = TruffleContract(CVTToken);
        App.contracts.CVTToken.setProvider(App.web3Provider);
        App.contracts.CVTToken.deployed().then(function(CVTToken) {
          console.log("CVTToken Address:", CVTToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.CVTTokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {
    if (App.loading) {
      return;
    }
    App.loading = true;

    var loader  = $('#loader');
    var content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Your Account: " + account);
      }
    })

    // Load token sale contract
    App.contracts.CVTTokenSale.deployed().then(function(instance) {
      CVTTokenSaleInstance = instance;
      return CVTTokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return CVTTokenSaleInstance.tokensSold();
    }).then(function(tokensSold) {
      App.tokensSold = tokensSold.toNumber();
      $('.tokens-sold').html(App.tokensSold);
      $('.tokens-available').html(App.tokensAvailable);

      var progressPercent = (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.CVTToken.deployed().then(function(instance) {
        CVTTokenInstance = instance;
        return CVTTokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.CVT-balance').html(balance.toNumber());
        App.loading = false;
        loader.hide();
        content.show();
      })
    });
  },

  buyTokens: function() {
    $('#content').hide();
    $('#loader').show();
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.CVTTokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }
}

$(function() {
  $(window).load(function() {
    App.init();
  })
});
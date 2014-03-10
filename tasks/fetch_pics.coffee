module.exports = (grunt) ->
  defaultBaseUrl = 'http://api.aydamarket.ru/v1/vendors.json'
  imageFsDir = './app/data/images'
  imageWebDir = 'data/images'
  target = './app/scripts/data/vendor_predefined.coffee'

  grunt.registerTask "fetchPics", "Fetch vendor pics", ->
    vendorKey = grunt.option('vendor-key')
    # http://api.3001.vkontraste.ru/v1/vendors.json
    baseUrl  = grunt.option('base-url') || defaultBaseUrl
    unless vendorKey
      grunt.fail.fatal "No vendor-key argument present. Usage: grunt #{@name} --vendor-key VENDOR_KEY"
    _ = require('underscore')
    fs = require('fs')
    path = require('path')
    requestJson = require('request-json')
    http = require('http-get')
    done = @async()

    grunt.log.writeln "Vendor key: #{vendorKey}"
    client = requestJson.newClient(baseUrl)
    client.get("?vendor_key=#{vendorKey}", (err, resp, body) ->
      grunt.fail.fatal(error) if error = (err or body.error)

      grunt.verbose.writeln JSON.stringify(body)
      tot = body.products.length
      n = 0
      _(body.products).each((product, ind) ->
        grunt.verbose.writeln "product: #{product.title}"
        filename = "#{ind}#{path.extname(product.image.mobile_url)}"
        grunt.verbose.writeln "path: #{product.image.mobile_url}"
        grunt.verbose.writeln "img: #{filename}"
        http.get(product.image.mobile_url, "#{imageFsDir}/#{filename}", (err, result) ->
          n = n + 1
          if err
            grunt.log.errorlns(err)
          else
            grunt.log.writeln " | ...image written to: #{result.file}"
            product.image.mobile_url = "#{imageWebDir}/#{filename}"
          if n == tot
            grunt.log.writeln "coffee module written to: #{target}"
            fs.writeFileSync(target, "define -> #{JSON.stringify(body)}")
            done()
        )
      )
    )

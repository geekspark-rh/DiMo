DiMo
====

Digital Motion visual art exhibit and game.

Contributing
------------

*Running* DiMo only requires a web browser, but if you wish to contribute,
there are a few dependencies that need to be installed.  NodeJS, NPM,
Ruby, and Sass.

### Dependencies

**Fedora/RHEL**

    sudo yum install nodejs npm ruby rubygem-sass

**Ubuntu**

    sudo apt-get install nodejs npm ruby ruby-sass

Once you have NodeJS, NPM, Ruby, and Sass installed, you may...

    git clone git@github.com:geekspark-rh/DiMo.git dimo
    cd dimo
    npm install

Dependencies are complete.  Now it is time to hack.

    grunt watch --dev

The project will be automatically re-built every time a file changes.
The `--dev` option turns off JS/CSS minification, to make debugging
easier.

After a build, open (or refresh) `build/index.html` in your browser of
choice (must support WebGL).

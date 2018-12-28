llvm-coverage-viewer
====================

> Wow, I guess I didn't test that after all :/.

# Prerequisites

* [node](https://nodejs.org/en/) - Latest version

## Features

 * Syntax Highlighting
 * Search For Files
 * IDE Like Interface
 * Outputs only one html file

## Install

```
npm install -g llvm-coverage-viewer
```

## Usage

```
# ...
# script that eventually export llvm-cov json report
# for example look at ./test/fixtures/cpp_project/build_report_fixture.sh
# ...

llvm-coverage-viewer -j json_report.json -o html_report.html
```

## Development

Clang compiler and code coverage tools must be installed to run tests.

```
git clone <this report>
cd <clone folder>

# build example c++ project
cd test/fixtures/cpp_project
./build_report_fixture.sh

npm install
npm run build # build dev server
npm start # start dev server
```

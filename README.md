llvm-coverage-viewer
====================

> I thought my tests covered that!

# Prerequisites

 * [node](https://nodejs.org) - any version
 * [npm](https://nodejs.org) - any version

# Prerequisites For Development

* [clang] - https://clang.llvm.org/
* [llvm-profdata] - https://llvm.org/docs/CommandGuide/llvm-profdata.html
* [llvm-cov] - https://llvm.org/docs/CommandGuide/llvm-cov.html

## Features

 * outputs only one html file
 * syntax highlighting
 * highlights missed code coverage
 * filter files by name
 * collapsible folder tree ui
 * uses react and material-ui

## Install

```sh
npm install -g llvm-coverage-viewer
```

## Usage

After you've successfully exported your llvm coverage report as JSON,
the following command will generate a beautiful report.

```sh
llvm-coverage-viewer -j json_report.json -o html_report.html
```

## How do I export llvm code coverage to JSON?

Use the `llvm-cov export` command.

I created an [example](test/fixtures/cpp_project/build_report_fixture.sh)
C++ project to generate and export llvm code coverage to JSON document
for testing and development.

```sh
llvm-cov report "<executable>" -instr-profile="all.profdata"
```

## Development

The following commands should start the development server so you can
start coding. If you want to load a different llvm code coverage report
while developing, you can change it by modifying the hardcoded path
[here](src/app/containers/ReportLoader.jsx)

```sh
# build example c++ project
cd test/fixtures/cpp_project
./build_report_fixture.sh

npm install
npm start
```

#!/bin/bash -xe
REPORT_JSON_OUTPUT="${PWD}/report.json"
PROFDATA_OUTPUT="${PWD}/all.profdata"
export LLVM_PROFILE_FILE="${PWD}/coverage-%p.profraw"

clang -std=c++17 -lstdc++ -fprofile-instr-generate -fcoverage-mapping main.cc -o main
./main
llvm-profdata merge -sparse *.profraw -o all.profdata
llvm-cov export "${PWD}/main" -instr-profile="${PROFDATA_OUTPUT}" > "${REPORT_JSON_OUTPUT}"
llvm-cov show "${PWD}/main" -instr-profile="${PROFDATA_OUTPUT}"
llvm-cov report "${PWD}/main" -instr-profile="${PROFDATA_OUTPUT}"
rm ./*.profraw
rm ./*.profdata
rm ./main

echo ""
echo "report saved to ${REPORT_JSON_OUTPUT}"
echo ""

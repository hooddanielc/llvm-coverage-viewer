#pragma once
#include <iostream>
#include "not_covered.h"

inline void partial_coverage(int i) {
  if (i == 0) {
    std::cout << "i = 0" << std::endl;
  } else if (i == 1) {
    std::cout << "i = 1" << std::endl;
  } else {
    not_covered(i);
    std::cout << "i does not equal 0 or 1" << std::endl;
  }
}

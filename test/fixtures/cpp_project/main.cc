#include "covered.h"
#include "not_covered.h"
#include "partial_coverage.h"

/* tested as unsused in this executable, do not call */
#include "subfolder_one/subfolder_one.h"
#include "subfolder_two/subfolder_two.h"

int main(int, char*[]) {
  covered();
  partial_coverage(0);
  partial_coverage(1);
  return 0;
}

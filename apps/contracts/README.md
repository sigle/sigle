### Generate coverage HTML report

To generate a coverage HTML report and open it in a browser, run:

```sh
pnpm test:report
genhtml lcov.info -o coverage/html
open coverage/html/index.html
```

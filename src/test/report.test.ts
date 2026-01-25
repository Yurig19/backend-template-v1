import * as fs from 'fs';
import * as path from 'path';
import { AggregatedResult } from '@jest/test-result';

export abstract class BaseReporter {
  protected abstract type: 'unit' | 'integration' | 'e2e';

  onRunComplete(_: any, results: AggregatedResult) {
    const outputDir = path.resolve(process.cwd(), 'reports', this.type);

    fs.mkdirSync(outputDir, { recursive: true });

    const report = {
      type: this.type,
      total: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numPendingTests,
      durationMs: Date.now() - (results.startTime ?? Date.now()),
      suites: results.testResults.map((suite) => ({
        file: suite.testFilePath,
        passed: suite.numPassingTests,
        failed: suite.numFailingTests,
        skipped: suite.numPendingTests,
        tests: suite.testResults.map((t) => ({
          name: t.fullName,
          status: t.status,
          duration: t.duration,
          failureMessages: t.failureMessages,
        })),
      })),
      generatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      path.join(outputDir, 'report.json'),
      JSON.stringify(report, null, 2)
    );

    this.generateHtml(report, outputDir);
  }

  protected generateHtml(report: any, outputDir: string) {
    const html = `
      <html>
        <head>
          <title>Test Report - ${report.type}</title>
          <style>
            body { font-family: Arial; padding: 16px }
            .fail { color: red }
            .pass { color: green }
          </style>
        </head>
        <body>
          <h1>${report.type.toUpperCase()} TESTS</h1>
          <p>Total: ${report.total}</p>
          <p class="pass">Passed: ${report.passed}</p>
          <p class="fail">Failed: ${report.failed}</p>

          <hr/>

          ${report.suites
            .map(
              (s: any) => `
                <h3>${s.file}</h3>
                <ul>
                  ${s.tests
                    .map(
                      (t: any) => `
                        <li class="${t.status === 'failed' ? 'fail' : 'pass'}">
                          ${t.name}
                        </li>
                      `
                    )
                    .join('')}
                </ul>
              `
            )
            .join('')}
        </body>
      </html>
    `;

    fs.writeFileSync(path.join(outputDir, 'report.html'), html);
  }
}

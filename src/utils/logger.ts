import chalk from 'chalk';
import ora, { type Ora } from 'ora';

class Logger {
  private spinner: Ora | null = null;
  private isVerbose = false;

  setVerbose(verbose: boolean) {
    this.isVerbose = verbose;
  }

  // 普通信息
  info(msg: string) {
    this.stopSpinner();
    console.log(chalk.blue('ℹ️  ') + msg);
  }

  // 成功信息
  success(msg: string) {
    this.stopSpinner();
    console.log(chalk.green('✅ ') + msg);
  }

  // 警告信息
  warn(msg: string) {
    this.stopSpinner();
    console.log(chalk.yellow('⚠️  ') + msg);
  }

  // 错误信息
  error(msg: string, err?: any) {
    this.stopSpinner();
    console.error(chalk.red('❌ ') + msg);
    if (err && this.isVerbose) {
      console.error(err);
    }
  }

  // 调试信息 (仅在 verbose 模式下显示)
  debug(msg: string) {
    if (this.isVerbose) {
      this.stopSpinner(); // 暂停 spinner 打印日志，再恢复? 有点麻烦，简单起见直接打印
      console.log(chalk.gray(`[DEBUG] ${msg}`));
    }
  }

  // 开始加载动画
  startSpinner(text: string) {
    this.stopSpinner();
    this.spinner = ora(text).start();
  }

  // 更新加载动画文本
  updateSpinner(text: string) {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  // 结束加载动画 (成功)
  succeedSpinner(text: string) {
    if (this.spinner) {
      this.spinner.succeed(text);
      this.spinner = null;
    } else {
      this.success(text);
    }
  }

  // 结束加载动画 (失败)
  failSpinner(text: string) {
    if (this.spinner) {
      this.spinner.fail(text);
      this.spinner = null;
    } else {
      this.error(text);
    }
  }

  private stopSpinner() {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}

export const logger = new Logger();

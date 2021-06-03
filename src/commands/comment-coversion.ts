import {
  commands,
  Position,
  Range,
  Selection,
  TextEditor,
  window,
} from "vscode";

class CommentConversion {
  private editor!: TextEditor;
  /**
   * 0: 替换选择内容，1: 替换整个文件
   */
  actionType: "0" | "1" = "0";
  constructor() {
    const editor = window.activeTextEditor;
    if (editor) {
      this.editor = editor;
      if (!this.isJavaScript(this.editor.document.languageId)) {
        window.showWarningMessage("请在js或ts文件下执行该命令");
        return;
      }
      // 获取鼠标选择区域文本
      const selectionText = editor.document.getText(editor.selection);
      // 如果有选择内容则用选择的文本，没有则用当前打开文件的内容作为模板
      let text = "";
      if (selectionText) {
        this.actionType = "0";
        text = selectionText;
      } else {
        this.actionType = "1";
        text = editor.document.getText();
      }
      this.main(text);
    }
  }

  main(text: string) {
    /**
     * 正则说明
     * 案例模板："  // ID"
     *
     * ([ \t]*)  匹配 // 前面的tab或者空格 并保存用以后面替换  匹配内容 “\t”
     * (.*) 匹配注释内容 匹配内容 “ID”
     */
    const str = text.replace(/([ \t]*)\/\/ (.*)/gm, "$1/**\n$1 * $2\n$1 */");
    if(str === text) {
      return;
    }
    this.replaceContent(str);
  }

  replaceContent(replaceStr: string) {
    let location: Range | Selection;
    if (this.actionType === "0") {
      location = this.editor.selection;
    } else {
      const start = new Position(0, 0);
      const end = new Position(this.editor.document.lineCount + 1, 0);
      location = new Range(start, end);
    }
    this.editor.edit(editBuilder => {
      editBuilder.replace(location, replaceStr);
    });
  }
  /**
   * 校验当前文件是否为js或ts
   */
  isJavaScript(languageId: string) {
    return languageId === "javascript" || languageId === "typescript";
  }
}

export const commentConversionCommands = commands.registerCommand(
  "jcc.conversion",
  () => {
    new CommentConversion();
  }
);

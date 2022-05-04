# 题目编辑器

题目编辑器通过 editorjs 项目进行驱动。

题目后端是一个 XML 格式，大概这样

```xml
<?xml version="1.0" encoding="UTF-8"?>
<problem mode="选择|填空|解答">
  <meta>
    <auther value="Float"/>
    <time value="2002-09-24+08:00"/>
    <!-- ... -->
  </meta>
  <!-- 同 div 级别 -->
  <contents> 
    一个测试的题目
    一般会存在(块级)
    <choice id="1">
      <ci></ci>
      <ci></ci>
    </choice id="2">
    <!-- inline -->
    <line id="3"/>

    <!-- 仅仅对解答题目开放的，都是块级 -->
    <subproblem tyoe="选择|填空|解答">
    </subproblem>
    <space id="4"/>
  </contents>
  <answers>
    <answer for="1">A</answer>
    <answer for="3">some ans ||</answer>
    <!-- or Regular Expression-->
    <answer for="3"><regular-expression value="/^[abc]$/"/></answer>
  </answers>
  <explainations>
    就一个普通纯文本
  </explainations>
</problem>
```

前端两个框框，上边题面下边解析，答案内嵌在标签里面。答案和子问题添加要写 plugin 了。

## Choice

这是个 pulugin，用 ol 和一个 input 实现的。

## Line

一个 inline plugin，直接 span 的方式实现。从 inline code 改过来，换成 span ，然后就可以了。

## subProblem

一个段落，可以选择后面是否包含占位符号，内部可以有 line。后面可以 with space

对于小题目前的解决方案是，把包含 `<span class="line">` 段落块和选择题块作为小题。意思就是直接自动判断题目类型了。

含有多个答案的，或者带 space 的 subProblem 直接当作解答题。

那就写好了

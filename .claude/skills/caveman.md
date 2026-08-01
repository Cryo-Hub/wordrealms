# Caveman Skill

Caveman is a minimalist coding approach: write code like you're explaining it to a caveman. No abstractions, no clever patterns, no premature optimizations. Just clear, direct, simple logic.

## Principles

1. **Direct over Abstract** - Write the code that does the thing, not a framework that could do the thing
2. **Readable over Clever** - Anyone should understand it without a PhD in your domain
3. **Linear over Recursive** - Simple loops beat elegant recursion
4. **Explicit over Implicit** - Make the logic visible; avoid magic
5. **No Dependencies** - Use what's built-in. If not built-in, write it

## When to use Caveman

- Prototyping or rapid discovery
- Code that others (non-experts) need to maintain
- Performance-critical paths (no abstraction overhead)
- Learning projects

## Example: Caveman vs. Over-engineered

```python
# Over-engineered (DON'T)
class DataProcessor:
    def __init__(self, config: Config):
        self.handler = HandlerFactory.create(config)
    
    def process(self, data: DataStream) -> Result:
        return self.handler.execute(Pipeline(data))

# Caveman (DO THIS)
for row in data:
    result = row * 2
    print(result)
```

## When NOT to use Caveman

- Systems that need extensibility
- Large codebases where abstraction prevents duplication
- When performance is proven to need optimization

---

**Caveman Checklist**
- ☐ I can explain this in one sentence
- ☐ A junior can understand it without help
- ☐ It uses only what's built-in
- ☐ No nested levels deeper than 3
- ☐ No functions longer than 50 lines

# Handoff

Prompts autocontidos para o papel **subagent**, um por fase (`F<n>-subagent.md`).

Disparados pelo agent, sem copiar e colar:

```bash
cd ~/Documents/dev/docket
cursor-agent -p --force --model composer-2.5 "$(cat Handoff/F0-subagent.md)"
```

Ficam versionados de propósito: um handoff é a evidência do que foi pedido quando o resultado não bate com o esperado.

Se um passo exigir decisão que não está escrita, o subagent deve **parar**. Spec incompleta volta para o agent — ver `Harness.md`.

# Documentação Técnica

> Ponto de entrada da documentação técnica do projeto.  
> **Stack ainda não definida** — este documento será expandido após a decisão de tecnologia.

## Motor de Cálculo

O núcleo da solução é um **motor de cálculo de demanda elétrica** que aplica as regras normativas da Neoenergia Pernambuco de forma automatizada e rastreável.

Responsabilidades previstas:

- Receber os parâmetros do projeto elétrico (tipo de edificação, unidades consumidoras, cargas)
- Selecionar e aplicar a tabela normativa correspondente
- Executar as fórmulas de demanda (individual e coletiva)
- Retornar o resultado com indicação das regras aplicadas em cada etapa

Documentação detalhada das fórmulas e regras será adicionada em `docs/tecnico/engine-calculo.md` após levantamento das normas Neoenergia PE.

---

## Design OOP (requisito POO)

A disciplina de **Programação Orientada a Objetos** exige que o motor seja modelado explicitamente com classes de domínio. O diagrama de classes e a justificativa de design serão documentados aqui.

Ver premissas iniciais em [`docs/negocio/premissas-desafio.md`](../negocio/premissas-desafio.md#requisito-poo).

---

## Convenções

A ser definido junto com a stack. Seguirá o mesmo padrão do projeto anterior:

- Idioma do código: inglês
- Texto de UI: português
- Rotas finas, lógica centralizada em services/classes de domínio
- Sem SQL/lógica de negócio nas camadas de entrada HTTP

export const SPACE_CHAR = " ";

export const TAGS = [
  {
    label: "Последовательный номер",
    value: "NUMBER",
  },
  {
    label: "Текущий день",
    value: "DAY",
  },
  {
    label: "Текущий месяц",
    value: "MONTH",
  },
  {
    label: "Текущий год",
    value: "YEAR",
  },
];

export const TAGS_VALUES = TAGS.map((tag) => `{${tag.value}}`);

import { yearly } from "@/data/netflix";
import { buildDataset, type Dataset } from "./dataset";
import { parseDelimitedText } from "./parse-file";

export type SampleId = "netflix" | "sales" | "students";

export const samples: { id: SampleId; label: string; blurb: string }[] = [
  { id: "netflix", label: "Netflix growth", blurb: "26 years of members, revenue and profit" },
  { id: "sales", label: "Coffee shop sales", blurb: "Orders by store, product and month" },
  { id: "students", label: "Student scores", blurb: "Grades, study hours and attendance" },
];

const salesCsv = `month,store,product,category,units,revenue
2024-01,Downtown,Latte,Drinks,820,3280
2024-01,Downtown,Croissant,Food,410,1435
2024-01,Airport,Latte,Drinks,1180,5310
2024-01,Airport,Muffin,Food,520,1820
2024-02,Downtown,Latte,Drinks,905,3620
2024-02,Downtown,Croissant,Food,455,1592
2024-02,Airport,Latte,Drinks,1240,5580
2024-02,Airport,Muffin,Food,610,2135
2024-03,Downtown,Latte,Drinks,988,3952
2024-03,Downtown,Cold Brew,Drinks,640,2880
2024-03,Airport,Latte,Drinks,1355,6097
2024-03,Airport,Cold Brew,Drinks,720,3240
2024-04,Downtown,Latte,Drinks,1040,4160
2024-04,Downtown,Croissant,Food,470,1645
2024-04,Airport,Cold Brew,Drinks,860,3870
2024-04,Suburb,Latte,Drinks,505,2020
2024-05,Downtown,Cold Brew,Drinks,780,3510
2024-05,Airport,Latte,Drinks,1410,6345
2024-05,Suburb,Muffin,Food,290,1015
2024-05,Suburb,Latte,Drinks,560,2240
2024-06,Downtown,Latte,Drinks,1125,4500
2024-06,Airport,Cold Brew,Drinks,940,4230
2024-06,Suburb,Croissant,Food,330,1155
2024-06,Suburb,Cold Brew,Drinks,420,1890`;

const studentsCsv = `student,class,study_hours,attendance,previous_score,final_score
S001,A,12,92,71,78
S002,A,4,64,55,52
S003,B,18,98,84,91
S004,B,9,81,66,69
S005,C,15,88,77,83
S006,C,2,55,48,44
S007,A,20,96,88,94
S008,B,7,73,60,61
S009,C,11,85,70,74
S010,A,16,90,80,86
S011,B,5,68,58,55
S012,C,13,87,74,79
S013,A,3,61,52,49
S014,B,19,95,86,92
S015,C,8,76,63,66
S016,A,14,89,75,81
S017,B,6,70,59,58
S018,C,17,93,82,88
S019,A,10,83,68,72
S020,B,1,50,45,41`;

export function loadSample(id: SampleId): Dataset {
  if (id === "sales") return parseDelimitedText("Coffee shop sales", salesCsv);
  if (id === "students") return parseDelimitedText("Student scores", studentsCsv);
  return buildDataset(
    "Netflix growth",
    yearly.map((r) => ({
      year: r.year,
      subscribers_millions: r.subscribers,
      revenue_billions: r.revenue,
      operating_income_billions: r.operatingIncome,
    })),
  );
}

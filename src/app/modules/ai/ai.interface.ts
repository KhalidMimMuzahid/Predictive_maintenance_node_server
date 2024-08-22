export type TThreshold = {
  sectionName: string; // threshold name
  temperature: number;
  vibrations: number;
};
export type TAI = {
  type: 'threshold';
  threshold: TThreshold;
};

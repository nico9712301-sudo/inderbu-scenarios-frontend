export const scenarioInfoCardItem = (
  label: string,
  Icon: React.ElementType,
  value?: string | number,
  extraClasses = "",
) => (
  <div className={extraClasses}>
    <h3 className="text-base font-medium text-gray-700 flex items-center gap-1">
      <Icon className="text-teal-600" /> {label}
    </h3>
    <p className="text-gray-600 text-sm pt-1">{value}</p>
  </div>
);

import { BriefcaseBusiness, Clock, MapPin } from "lucide-react";
import { getOfficeConfig } from "@/services/configuration";

export async function OfficeInformation() {
  const office = await getOfficeConfig();

  return (
    <div className="grid gap-4 text-sm">
      <div className="flex gap-3">
        <BriefcaseBusiness
          aria-hidden="true"
          className="text-secondary mt-0.5 size-4"
        />
        <div>
          <p className="text-foreground font-medium">{office.serviceMode}</p>
          <p className="text-muted-foreground mt-1">
            {office.specialties.join(", ")}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <MapPin aria-hidden="true" className="text-secondary mt-0.5 size-4" />
        <div>
          <p className="text-foreground font-medium">
            {office.statesServed.join(", ")}
          </p>
          <p className="text-muted-foreground mt-1">
            {office.citiesServed.join(", ")}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Clock aria-hidden="true" className="text-secondary mt-0.5 size-4" />
        <p className="text-muted-foreground">{office.workingHours}</p>
      </div>
    </div>
  );
}

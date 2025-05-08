import { Button } from "@/components/ui/button";
import { FileText, Calendar, Headset } from "lucide-react";
import { useState } from "react";
import { AdmissionModal } from "../modals/admission-modal";

export function AdmissionCTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="admission" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text Content */}
            <div className="p-8 lg:p-12">
              <span className="inline-block bg-primary-100 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
                Admissions Open 2023-24
              </span>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Begin Your Journey with Trinity
              </h2>
              <p className="text-gray-600 mb-6">
                We're excited to welcome new students to join our vibrant community. Our admission
                process is designed to be straightforward and supportive.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">Simple Application Process</h3>
                    <p className="text-sm text-gray-600">
                      Easy online application form with clear instructions
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">Transparent Timelines</h3>
                    <p className="text-sm text-gray-600">
                      Clear schedules for admission tests and interviews
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary">
                    <Headset className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">Supportive Guidance</h3>
                    <p className="text-sm text-gray-600">
                      Dedicated team to assist with your queries
                    </p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white">
                Apply for Admission
              </Button>
            </div>

            {/* Image Section */}
            <div className="bg-primary flex items-center justify-center p-8 lg:p-0">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Students at Trinity International School"
                className="rounded-lg shadow-md max-h-80 lg:max-h-full"
              />
            </div>
          </div>
        </div>
      </div>

      <AdmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}

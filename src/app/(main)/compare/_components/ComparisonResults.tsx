'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { tabCrossfade, staggerContainer } from '@/lib/animations';
import AnimatedSection from '@/components/AnimatedSection';
import SchoolHeaderCards from './SchoolHeaderCards';
import MobileSchoolSwiper from './MobileSchoolSwiper';
import RadarChart from './RadarChart';
import KHDARatingVisual from './KHDARatingVisual';
import FeeComparisonChart from './FeeComparisonChart';
import FacilitiesGrid from './FacilitiesGrid';
import StrengthsComparison from './StrengthsComparison';
import AIComparisonCard from './AIComparisonCard';
import ComparisonTable from './ComparisonTable';
import CompareActionBar from './CompareActionBar';
import MapView from '@/components/MapView';
import type { CompareResponse } from '@/types';

interface ComparisonResultsProps {
  data: CompareResponse;
}

export default function ComparisonResults({ data }: ComparisonResultsProps) {
  const { schools, ai_comparison, fee_history, khda_reports, review_summary } =
    data;

  return (
    <div className="space-y-8">
      {/* School header cards — desktop */}
      <AnimatedSection>
        <div className="hidden md:block">
          <SchoolHeaderCards schools={schools} />
        </div>
        <MobileSchoolSwiper schools={schools} />
      </AnimatedSection>

      {/* Sticky tab navigation */}
      <Tabs defaultValue="overview" className="compare-tabs">
        <div className="compare-tabs-nav sticky top-14 sm:top-16 z-30 -mx-4 bg-white/80 px-4 py-2 backdrop-blur-lg sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-gray-100">
          <TabsList variant="line" className="w-full justify-start gap-0 overflow-x-auto no-scrollbar">
            <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">
              Overview
            </TabsTrigger>
            <TabsTrigger value="ratings" className="text-xs sm:text-sm whitespace-nowrap">
              Ratings & Reviews
            </TabsTrigger>
            <TabsTrigger value="fees" className="text-xs sm:text-sm whitespace-nowrap">
              Fees
            </TabsTrigger>
            <TabsTrigger value="facilities" className="text-xs sm:text-sm whitespace-nowrap">
              Facilities
            </TabsTrigger>
            <TabsTrigger value="location" className="text-xs sm:text-sm whitespace-nowrap">
              Location
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs sm:text-sm whitespace-nowrap">
              AI Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ─── Overview Tab ─── */}
        <TabsContent value="overview" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-8 pt-4"
            >
              {/* Radar chart */}
              <AnimatedSection>
                <div className="rounded-xl border border-gray-100 bg-white p-3 sm:p-6 shadow-sm">
                  <h3 className="mb-3 sm:mb-4 text-sm font-semibold text-gray-700">
                    At a Glance
                  </h3>
                  <RadarChart schools={schools} />
                </div>
              </AnimatedSection>

              {/* Strengths / considerations */}
              <AnimatedSection delay={0.1}>
                <StrengthsComparison schools={schools} />
              </AnimatedSection>

              {/* Quick AI summary */}
              <AnimatedSection delay={0.2}>
                <AIComparisonCard
                  schoolIds={schools.map((s) => s.id)}
                  staticText={ai_comparison}
                />
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ─── Ratings Tab ─── */}
        <TabsContent value="ratings" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="ratings"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pt-4"
            >
              <AnimatedSection>
                <KHDARatingVisual
                  schools={schools}
                  khdaReports={khda_reports}
                  reviewSummary={review_summary}
                />
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ─── Fees Tab ─── */}
        <TabsContent value="fees" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="fees"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pt-4"
            >
              <AnimatedSection>
                <div className="rounded-xl border border-gray-100 bg-white p-3 sm:p-6 shadow-sm">
                  <h3 className="mb-3 sm:mb-4 text-sm font-semibold text-gray-700">
                    Fee Comparison
                  </h3>
                  <FeeComparisonChart
                    schools={schools}
                    feeHistory={fee_history}
                  />
                </div>
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ─── Facilities Tab ─── */}
        <TabsContent value="facilities" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="facilities"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pt-4"
            >
              <AnimatedSection>
                <FacilitiesGrid schools={schools} />
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ─── Location Tab ─── */}
        <TabsContent value="location" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="location"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pt-4"
            >
              <AnimatedSection>
                <div className="rounded-xl border border-gray-100 bg-white p-3 sm:p-6 shadow-sm">
                  <h3 className="mb-3 sm:mb-4 text-sm font-semibold text-gray-700">
                    School Locations
                  </h3>
                  <MapView
                    schools={schools.map((s) => ({
                      latitude: s.latitude,
                      longitude: s.longitude,
                      name: s.name,
                      slug: s.slug,
                      khda_rating: s.khda_rating,
                      fee_min: s.fee_min,
                      fee_max: s.fee_max,
                    }))}
                  />
                </div>
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ─── AI Analysis Tab ─── */}
        <TabsContent value="ai" className="compare-tab-content">
          <AnimatePresence mode="wait">
            <motion.div
              key="ai"
              variants={tabCrossfade}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6 pt-4"
            >
              <AnimatedSection>
                <AIComparisonCard
                  schoolIds={schools.map((s) => s.id)}
                  staticText={ai_comparison}
                />
              </AnimatedSection>

              {/* Full detail table */}
              <AnimatedSection delay={0.1}>
                <ComparisonTable schools={schools} />
              </AnimatedSection>
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Action bar */}
      <CompareActionBar schoolSlugs={schools.map((s) => s.slug)} />

      {/* Bottom padding for mobile action bar */}
      <div className="h-16 md:hidden" />
    </div>
  );
}

/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * vim: set ts=8 sts=4 et sw=4 tw=99:
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "jit/EagerSimdUnbox.h"

#include "jit/MIR.h"
#include "jit/MIRGenerator.h"
#include "jit/MIRGraph.h"

namespace js {
namespace jit {

// Do not optimize any Phi instruction which has conflicting Unbox operations,
// as this might imply some intended polymorphism.
static bool
CanUnboxSimdPhi(const JitRealm* jitRealm, MPhi* phi, SimdType unboxType)
{
    MOZ_ASSERT(phi->type() == MIRType::Object);

    // If we are unboxing, we are more than likely to have boxed this SIMD type
    // once in baseline, otherwise, we cannot create a MSimdBox as we have no
    // template object to use.
    if (!jitRealm->maybeGetSimdTemplateObjectFor(unboxType))
        return false;

    MResumePoint* entry = phi->block()->entryResumePoint();
    MIRType mirType = SimdTypeToMIRType(unboxType);
    for (MUseIterator i(phi->usesBegin()), e(phi->usesEnd()); i != e; i++) {
        // If we cannot recover the Simd object at the entry of the basic block,
        // then we would have to box the content anyways.
        if ((*i)->consumer() == entry && !entry->isRecoverableOperand(*i))
            return false;

        if (!(*i)->consumer()->isDefinition())
            continue;

        MDefinition* def = (*i)->consumer()->toDefinition();
        if (def->isSimdUnbox() && def->toSimdUnbox()->type() != mirType)
            return false;
    }

    return true;
}

static void
UnboxSimdPhi(const JitRealm* jitRealm, MIRGraph& graph, MPhi* phi, SimdType unboxType)
{
    TempAllocator& alloc = graph.alloc();

    // Unbox and replace all operands.
    for (size_t i = 0, e = phi->numOperands(); i < e; i++) {
        MDefinition* op = phi->getOperand(i);
        MSimdUnbox* unbox = MSimdUnbox::New(alloc, op, unboxType);
        op->block()->insertAtEnd(unbox);
        phi->replaceOperand(i, unbox);
    }

    // Change the MIRType of the Phi.
    MIRType mirType = SimdTypeToMIRType(unboxType);
    phi->setResultType(mirType);

    MBasicBlock* phiBlock = phi->block();
    MInstruction* atRecover = phiBlock->safeInsertTop(nullptr, MBasicBlock::IgnoreRecover);
    MInstruction* at = phiBlock->safeInsertTop(atRecover);

    // Note, we capture the uses-list now, as new instructions are not visited.
    MUseIterator i(phi->usesBegin()), e(phi->usesEnd());

    // Add a MSimdBox, and replace all the Phi uses with it.
    JSObject* templateObject = jitRealm->maybeGetSimdTemplateObjectFor(unboxType);
    InlineTypedObject* inlineTypedObject = &templateObject->as<InlineTypedObject>();
    MSimdBox* recoverBox = MSimdBox::New(alloc, nullptr, phi, inlineTypedObject, unboxType, gc::DefaultHeap);
    recoverBox->setRecoveredOnBailout();
    phiBlock->insertBefore(atRecover, recoverBox);

    MSimdBox* box = nullptr;
    while (i != e) {
        MUse* use = *i++;
        MNode* ins = use->consumer();

        if ((ins->isDefinition() && ins->toDefinition()->isRecoveredOnBailout()) ||
            (ins->isResumePoint() && ins->toResumePoint()->isRecoverableOperand(use)))
        {
            use->replaceProducer(recoverBox);
            continue;
        }

        if (!box) {
            box = MSimdBox::New(alloc, nullptr, phi, inlineTypedObject, unboxType, gc::DefaultHeap);
            phiBlock->insertBefore(at, box);
        }

        use->replaceProducer(box);
    }
}

bool
EagerSimdUnbox(MIRGenerator* mir, MIRGraph& graph)
{
    const JitRealm* jitRealm = mir->realm->jitRealm();
    for (PostorderIterator block = graph.poBegin(); block != graph.poEnd(); block++) {
        if (mir->shouldCancel("Eager Simd Unbox"))
            return false;

        for (MInstructionReverseIterator ins = block->rbegin(); ins != block->rend(); ins++) {
            if (!ins->isSimdUnbox())
                continue;

            MSimdUnbox* unbox = ins->toSimdUnbox();
            if (!unbox->input()->isPhi())
                continue;

            MPhi* phi = unbox->input()->toPhi();
            if (!CanUnboxSimdPhi(jitRealm, phi, unbox->simdType()))
                continue;

            UnboxSimdPhi(jitRealm, graph, phi, unbox->simdType());
        }
    }

    return true;
}

} /* namespace jit */
} /* namespace js */
